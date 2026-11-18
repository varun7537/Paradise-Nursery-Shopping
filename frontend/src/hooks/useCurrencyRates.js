// src/hooks/useCurrencyRates.js
import { useDispatch } from "react-redux";
import { setRates } from "../store/currencySlice";
import { useEffect } from "react";

const useCurrencyRates = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD"); // Example API
        const data = await response.json();
        dispatch(setRates(data.rates));
      } catch (error) {
        console.error("Error fetching currency rates:", error);
      }
    };

    fetchCurrencyRates();
  }, [dispatch]);
};

export default useCurrencyRates;
