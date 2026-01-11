import axios from "axios";
import * as cheerio from "cheerio";

import type { DilemmaData } from "../Types";

const BASE_URL = "https://willyoupressthebutton.com";

export async function fetchDilemma(code?: string): Promise<DilemmaData> {
	let targetId = code;

	try {
		if (!targetId) {
			const response = await axios.get(BASE_URL, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				},
				maxRedirects: 5,
				validateStatus: (status) => status < 500,
			});

			const finalUrl = response.request.res.responseUrl || BASE_URL;
			const urlMatch = finalUrl.match(/willyoupressthebutton\.com\/(\d+)/);

			if (urlMatch && urlMatch[1]) {
				targetId = urlMatch[1];
			} else {
				const htmlMatch = response.data.match(/willyoupressthebutton\.com\/(\d+)/);
				if (htmlMatch) {
					targetId = htmlMatch[1];
				}
			}

			if (!targetId) {
				throw new Error("Could not determine a random dilemma ID");
			}
		}

		const targetUrl = `${BASE_URL}/${targetId}/yes`;

		const { data } = await axios.get(targetUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		});

		const $ = cheerio.load(data);

		const question = $("#cond").text().trim();
		const result = $("#res").text().trim();

		let yesText = $(".peoplePressed").text().trim();
		let noText = $(".peopleDidntpress").text().trim();

		if (!yesText) yesText = $("#yes_bar").text().trim();
		if (!noText) noText = $("#no_bar").text().trim();

		const parseStats = (text: string) => {
			const cleanText = text.replace(/\s+/g, " ");

			const percentMatch = cleanText.match(/(\d+)%/);
			const countMatch = cleanText.match(/([\d,]+)\s*votes?/i);

			return {
				percentage: percentMatch ? percentMatch[1] + "%" : "0%",
				count: countMatch ? countMatch[1].replace(/,/g, "") : "0",
			};
		};

		if (!question || !result) {
			throw new Error("Invalid ID or content structure changed");
		}

		return {
			id: targetId!,
			url: `${BASE_URL}/${targetId}`,
			question,
			result,
			stats: {
				yes: parseStats(yesText),
				no: parseStats(noText),
			},
		};
	} catch (error: any) {
		throw error;
	}
}
