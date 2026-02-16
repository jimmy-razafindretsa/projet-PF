
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface DeletedOrderEmailProps {
    clientName: string;
    orderId: string;
}

export const DeletedOrderEmail = ({
    clientName,
    orderId,
}: DeletedOrderEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Order Removed for {clientName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Order Removed</Heading>
                    <Text style={text}>
                        The order for <strong>{clientName}</strong> (ID: {orderId}) has been removed from the system.
                    </Text>
                    <Section style={alertSection}>
                        <Text style={alertText}>
                            This action was performed on the dashboard. No further action is required.
                        </Text>
                    </Section>
                    <Text style={footer}>
                        François Bertho Production
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const h1 = {
    color: "#191D6E",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const text = {
    color: "#333",
    fontSize: "16px",
    lineHeight: "26px",
};

const alertSection = {
    padding: "24px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e6ebf1",
    borderRadius: "4px",
    margin: "20px 0",
};

const alertText = {
    color: "#555",
    fontSize: "14px",
    fontStyle: "italic",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    marginTop: "20px",
    textAlign: "center" as const,
};
