interface ArticleContentProps {
  content: string
}

export const ArticleContent = ({ content }: ArticleContentProps) => {
  return (
    <div className="prose prose-lg max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}