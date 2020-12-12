import { Button } from "@chakra-ui/core";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../../../api-utils/api";
import getVerifiedUser, { APIUser } from "../../../../api-utils/getVerifedUser";
import ControlledInput from "../../../../components/ControlledInput";
import { BasicSiteLayout } from "../../../../components/SiteLayout";
import { SiteTabs } from "../../../../components/SiteTabs";
import { database } from "../../../../data/database";
import { siteNodeQuery } from "../../../../data/SiteNodes";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const verifiedUser = await getVerifiedUser(context.req);
  const siteName = String(context.params?.siteId);
  const childKeys = String(context.params?.childKeys || "").split(",");
  if (!verifiedUser) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const site = await database.site.findUnique({ where: { name: siteName } });
  const siteQuery = { name: siteName };

  const nodesQuery = siteNodeQuery(siteName, childKeys);
  if (nodesQuery === null) throw new Error("Unexpectd nullfail");
  const nodes = await database.siteNode.findMany({
    where: nodesQuery,
    include: { SiteNode: { select: { id: true, key: true } } },
  });

  const node = nodes[0];
  if (!node) {
    return {
      redirect: {
        destination: `/sites/${siteName}/dashboard/${childKeys.slice(0, childKeys.length - 1).join("/")}`,
        permanent: false,
      },
    };
  }
  const children = node.SiteNode;

  return {
    props: {
      user: verifiedUser,
      siteName,
      address: childKeys,
      node: {
        value: node.value,
      },
    },
  };
};

function EditForm({ value, siteName, address }: { value: any; siteName: string; address: string[] }) {
  const { control, handleSubmit } = useForm({
    mode: "onBlur",
    defaultValues: { jsonValue: JSON.stringify(value, null, 2) },
  });
  const { push } = useRouter();
  return (
    <form
      onSubmit={handleSubmit((data) => {
        api("node-edit", {
          value: JSON.parse(data.jsonValue),
          siteName,
          address,
        })
          .then(() => {
            push(`/sites/${siteName}/dashboard/${address.join("/")}`);
          })
          .catch((e) => {
            console.error(e);
            alert("could not save. check the console ok thanks");
          });
      })}
    >
      <ControlledInput type="textarea" control={control} name="jsonValue" />
      <Button type="submit">Save</Button>
    </form>
  );
}

export default function ChildNodePage({
  user,
  siteName,
  address,
  node,
}: {
  user: APIUser;
  siteName: string;
  address: string[];
  node: {
    value: any;
  };
}): ReactElement {
  return (
    <BasicSiteLayout
      user={user}
      content={
        <>
          <SiteTabs tab="data" siteName={siteName} address={address} />
          <EditForm value={node.value} siteName={siteName} address={address} />
        </>
      }
    />
  );
}