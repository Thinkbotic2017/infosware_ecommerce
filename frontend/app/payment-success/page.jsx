import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h2>Payment successful. Thank you!</h2>
      <Link href="/">Back to home</Link>
    </div>
  );
}