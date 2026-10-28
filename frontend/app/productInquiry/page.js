import { Suspense } from "react";
import ProductInquiry from "../components/products/ProductInquiry";


export default function Page() {

return (

<Suspense fallback={<div>Loading...</div>}>

  <ProductInquiry />

</Suspense>


);
}
