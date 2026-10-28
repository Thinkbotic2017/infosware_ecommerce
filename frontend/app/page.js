"use client"

import Banner from "./components/home/Banner";
import Categories from "./components/home/Categories";
import CatNavbar from "./components/Layouts/CatNavbar";
import DealsSection from "./components/home/Discount";
import CollectionsSection from "./components/home/FeaturedCards";
import Product from "./components/home/Product";
import Slider from "./components/home/Slider";
import TopRatedProducts from "./components/home/TopRated";
import ContactForm from "./components/Layouts/ContactForm";
import RecentlyViewed from "./components/home/RecentlyViewed";
import {
useEffect
} from "react";

import {
usePathname
} from "next/navigation";


export default function Home() {

const pathname =
usePathname();

useEffect(() => {

  if (
window.location.hash ===
"#today-deals"
  ) {

    const section =
document.getElementById(
"today-deals"
    );

    if (section) {

      section.scrollIntoView({

        behavior: "smooth",
      });
    }
  }

}, [pathname]);

  return (
   
    <div className="">
      <CatNavbar />
     <Banner />
      {/* <Slider /> */}
      <Categories />
<Product />
<CollectionsSection />
<RecentlyViewed />
<TopRatedProducts />
<DealsSection />
<ContactForm />
    </div>
  );
}
