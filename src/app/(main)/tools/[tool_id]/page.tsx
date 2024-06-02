type Props = {
  params: {
    tool_id: string;
  };
};

export default async function ToolsPage({ params }: Props) {
  return <>This is Single Tool Page: {params.tool_id}</>;
}
