import AdCopyGenerator from "@/components/content/ad-copy-generator";

export default function AdCopyGeneratorPage() {
  // Using business ID 1 as default (demo business)
  const businessId = 1;
  
  return <AdCopyGenerator businessId={businessId} />;
}