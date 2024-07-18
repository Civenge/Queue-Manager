import { useRouter } from "next/router";

const Page = () => {
  const router = useRouter();
  const { pageName } = router.query;

  return (
    <div>
      <h1>Page: {pageName}</h1>
    </div>
  );
};

export default Page;
