import React from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import { InnerWidth } from "./CommonViews";
import AvenLogo from "./AvenLogo";

const HeaderContainer = styled.div`
  background: #0e2b49;
`;

export default function SiteHeader() {
  return (
    <HeaderContainer>
      <InnerWidth>
        <Link href="/">
          <div style={{ cursor: "pointer" }}>
            <AvenLogo />
          </div>
        </Link>
      </InnerWidth>
    </HeaderContainer>
  );
}
