
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface UpdatedOrderEmailProps {
    clientName: string;
    orderId: string;
    updates: Record<string, any>;
    orderUrl: string;
}

export const UpdatedOrderEmail = ({
    clientName,
    orderId,
    updates,
    orderUrl,
}: UpdatedOrderEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Order Updated for {clientName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Order Updated</Heading>
                    <Text style={text}>
                        The order for <strong>{clientName}</strong> has been updated.
                    </Text>
                    <Section style={section}>
                        <Text style={text}>
                            <strong>Order ID:</strong> {orderId}
                        </Text>
                        {/* We could list updates here if we wanted to be fancy, but keeping it simple */}
                        <Text style={text}>
                            Please check the dashboard for the latest details.
                        </Text>
                    </Section>
                    <Section style={btnContainer}>
                        <Button style={button} href={orderUrl}>
                            View Order
                        </Button>
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

const section = {
    padding: "24px",
    border: "1px solid #e6ebf1",
    borderRadius: "4px",
    margin: "20px 0",
};

const btnContainer = {
    textAlign: "center" as const,
};

const button = {
    backgroundColor: "#191D6E",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    marginTop: "20px",
    textAlign: "center" as const,
};
