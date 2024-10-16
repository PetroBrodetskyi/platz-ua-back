import axios from "axios";

export const getSitemapUrls = async () => {
  const baseUrl = "https://platzua.com";

  const staticUrls = [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: 1.0 },
    { loc: `${baseUrl}/how-it-works`, changefreq: "monthly", priority: 0.7 },
    { loc: `${baseUrl}/privacy-policy`, changefreq: "monthly", priority: 0.7 },
    { loc: `${baseUrl}/create`, changefreq: "monthly", priority: 0.7 },
  ];

  try {
    const response = await axios.get(
      "https://platz-ua-back.vercel.app/api/products/public"
    );
    const dynamicUrls = response.data.map((product) => ({
      loc: `${baseUrl}/product/${product._id}`,
      changefreq: "daily",
      priority: 0.5,
    }));
    console.log("Fetching dynamic URLs...");
    return [...staticUrls, ...dynamicUrls];
  } catch (error) {
    console.error("Error fetching dynamic URLs:", error);
    return staticUrls;
  }
};
