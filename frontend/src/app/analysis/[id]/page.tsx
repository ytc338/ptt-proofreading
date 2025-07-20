import AnalysisDetail from '@/components/AnalysisDetail';

// Per your instruction, I am defining the params prop as a Promise.
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AnalysisPage({ params }: Props) {
  // Awaiting the params prop to get its resolved value.
  const resolvedParams = await params;

  // Passing the resolved ID to the client component.
  return <AnalysisDetail id={resolvedParams.id} />;
}
