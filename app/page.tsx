import { LyrixRenderer } from "@/components/lyrix/lyrix-renderer";
import { LyrixPageService } from "@/lib/lyrix-page-service";

export default async function Home() {
  const pageService = new LyrixPageService();
  const document = await pageService.getPageDocument("/");

  return <LyrixRenderer document={document} />;
}
