import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const CityContext = createContext();

export function CityProvider({ children }) {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await axiosInstance.get('/location/cities');
                setCities(res.data.cities);
                
                // Load from localStorage or default to first city
                const savedCitySlug = localStorage.getItem('selected_city');
                if (savedCitySlug) {
                    const city = res.data.cities.find(c => c.slug === savedCitySlug);
                    if (city) setSelectedCity(city);
                } else if (res.data.cities.length > 0) {
                    setSelectedCity(res.data.cities[0]);
                }
            } catch (err) {
                console.error('Failed to fetch cities:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCities();
    }, []);

    const changeCity = (city) => {
        setSelectedCity(city);
        localStorage.setItem('selected_city', city.slug);
    };

    return (
        <CityContext.Provider value={{ cities, selectedCity, changeCity, isLoading }}>
            {children}
        </CityContext.Provider>
    );
}

export const useCity = () => {
    const context = useContext(CityContext);
    if (!context) throw new Error('useCity must be used within a CityProvider');
    return context;
};
