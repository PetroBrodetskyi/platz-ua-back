import express from "express";
import { getSitemapUrls } from "../sitemapLogic.js";

const sitemapRouter = express.Router();

sitemapRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const urls = await getSitemapUrls();
    const sitemapXml = generateSitemap(urls);
    res.header("Content-Type", "application/xml");
    res.send(sitemapXml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

function generateSitemap(urls) {
  const urlset = urls
    .map(
      (url) => `
      <url>
        <loc>${url.loc}</loc>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urlset}
    </urlset>`;
}

export default sitemapRouter;
