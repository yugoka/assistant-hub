export default function Loader(props: any) {
  return (
    <div
      className="flex flex-col h-full items-center justify-center"
      {...props}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent dark:border-gray-700 dark:border-t-transparent" />
    </div>
  );
}
