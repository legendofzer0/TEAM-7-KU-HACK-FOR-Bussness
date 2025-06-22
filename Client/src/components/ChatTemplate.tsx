interface ChatTemplateProps {
  request: string;
  response: string;
}

function ChatTemplate({ request, response }: ChatTemplateProps) {
  return (
    <>
      <div className="request">{request}</div>
      <div className="response">{response}</div>
    </>
  );
}

export default ChatTemplate;
