import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type ResetPasswordEmailProps = {
  resetUrl: string;
  userEmail: string;
};

export const ResetPasswordEmail = ({
  resetUrl,
  userEmail,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your chillpen password</Preview>
    <Body style={body}>
      <Container style={container}>
        <Section>
          <Text style={brand}>chillpen.club</Text>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={paragraph}>
            We got a request to reset the password for{" "}
            <strong style={accent}>{userEmail}</strong>. Choose a new one and
            you’re back to building worlds.
          </Text>
          <Button style={button} href={resetUrl}>
            Reset password
          </Button>
          <Text style={muted}>
            This link expires soon. If you didn’t ask to reset your password,
            you can safely ignore this email — nothing changes.
          </Text>
          <Hr style={divider} />
          <Text style={fineprint}>
            Or paste this link into your browser:
            <br />
            {resetUrl}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const body = {
  backgroundColor: "#0a0a0d",
  color: "#f6f4f1",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "48px 32px",
  maxWidth: "480px",
};

const brand = {
  color: "#e8b45a",
  fontSize: "13px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  margin: "0 0 16px",
};

const heading = {
  color: "#f6f4f1",
  fontSize: "30px",
  fontWeight: 600,
  margin: "0 0 16px",
};

const paragraph = {
  color: "#c9c7c2",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 28px",
};

const accent = { color: "#f0c97a" };

const button = {
  backgroundColor: "#e8b45a",
  borderRadius: "6px",
  color: "#0a0a0d",
  fontSize: "15px",
  fontWeight: 600,
  padding: "12px 28px",
  textDecoration: "none",
};

const muted = {
  color: "#8a8a93",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "28px 0 0",
};

const divider = { borderColor: "#1f1f25", margin: "28px 0" };

const fineprint = {
  color: "#5f5f68",
  fontSize: "12px",
  lineHeight: "18px",
  wordBreak: "break-all" as const,
};
