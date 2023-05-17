import * as cheerio from "cheerio";

interface MetaData {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
}

const getMetaDataForUrl = async (url: string): Promise<MetaData> => {
  try {
    const fetchResult = await fetch(url);
    const htmlText = await fetchResult.text();
    const $ = cheerio.load(htmlText);

    const title = $("title").text();

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content");

    let icon =
      $('url[rel="apple-touch-icon"]').attr("href") ||
      $('url[rel="icon"]').attr("href");

    if (icon && !icon.includes("http")) {
      icon = url.slice(-1) == "/" ? url.slice(0, -1) + icon : url + icon;
    }

    let image = $('meta[property="og:image"]').attr("content");

    if (image && !image.includes("http")) {
      image = url.slice(-1) == "/" ? url.slice(0, -1) + image : url + image;
    }

    return {
      title: title,
      description: description,
      image: image,
      icon: icon,
    };
  } catch (error) {
    throw new Error("Can't get metadata");
  }
};
