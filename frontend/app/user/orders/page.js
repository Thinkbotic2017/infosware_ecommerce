import Order from "@/app/components/Profile/Order";
import { Suspense } from "react";



export default function Page() {

return (


<Suspense fallback={<div>Loading...</div>}>

  <Order />

</Suspense>


);
}
