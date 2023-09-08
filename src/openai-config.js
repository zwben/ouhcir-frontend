import OpenAI from "openai";

delete configuration.baseOptions.headers['User-Agent'];

export const openai = new OpenAI({
    organization: "org-ckyITK04BLyIhpKcFWGyUcRH",
    apiKey: process.env.REACT_APP_OPENAI_API_KEY
});
