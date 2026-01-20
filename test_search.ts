import { searchBooks } from "./src/lib/api";

async function test() {
  console.log("Testing Public Domain Book...");
  const publicDomainBooks = await searchBooks("Pride and Prejudice");
  const pride = publicDomainBooks.find((b) => b.title.includes("Pride"));
  if (pride) {
    console.log(`Title: ${pride.title}`);
    console.log(`Year: ${pride.firstPublishYear}`);
    console.log(`Is Public Domain: ${pride.isPublicDomain}`);
  } else {
    console.log("Pride and Prejudice not found.");
  }

  console.log("\nTesting Copyrighted Book...");
  const modernBooks = await searchBooks("Harry Potter");
  const harry = modernBooks.find((b) => b.title.includes("Potter"));
  if (harry) {
    console.log(`Title: ${harry.title}`);
    console.log(`Year: ${harry.firstPublishYear}`);
    console.log(`Is Public Domain: ${harry.isPublicDomain}`);
  } else {
    console.log("Harry Potter not found.");
  }
}

test();
