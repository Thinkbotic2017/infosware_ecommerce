"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // FETCH CART (always reads the real cart from the server)
  const fetchCart = async () => {
    try {
      if (user) {
        const res = await api.get("/api/user/cart");
        console.log("Cart Data", res.data);
        setCartItems(res.data.items || []);
      } else {
        // logged out: nothing to show
        setCartItems([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Load the cart when the user logs in or out
  useEffect(() => {
    fetchCart();
  }, [user]);

  // Reload the cart when another page says it changed (for example after an order)
  useEffect(() => {
    const refresh = () => fetchCart();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, [user]);

  // CLEAR CART ON SCREEN (the server already emptied it)
  const clearCart = () => setCartItems([]);

  // ADD TO CART
  const addToCart = async (product) => {
    try {
      // LOGIN USER
      if (user) {
        await api.post("/api/user/cart", {
          productId: product._id,
          quantity: product.quantity || 1,
          imageColor: product.imageColor || "",
        });

        // REFETCH
        await fetchCart();
      }

      // GUEST USER
      else {
        let updatedCart = [...cartItems];

        const exists = updatedCart.find(
          (item) => (item._id || item.id) === (product._id || product.id)
        );

        if (exists) {
          toast.error("Already in cart");
          return;
        }

        updatedCart.push(product);
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add cart");
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (productId) => {
    try {
      // LOGIN USER
      if (user) {
        await api.delete(`/api/user/cart/remove/${productId}`);

        // REFETCH
        await fetchCart();
      }

      // GUEST USER
      else {
        const updatedCart = cartItems.filter(
          (item) => (item._id || item.id) !== productId
        );
        setCartItems(updatedCart);
      }

      toast.success("Removed from cart");
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove cart item");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        fetchCart,
        clearCart,
        addToCart,
        removeFromCart,
        cartCount: cartItems.length,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);