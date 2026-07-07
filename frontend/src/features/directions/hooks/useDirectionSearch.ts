import { useState, useEffect } from "react";

import { useDebounce } from "@/hooks/useDebounce";

import {
    SearchService,
    type PlaceSuggestion,
} from "@/services/map4d/search.service";

import { type LocationState } from "./useDirection";


interface UseDirectionSearchProps {

    currentCenter?: {
        lat: number;
        lng: number;
    };

    origin: LocationState | null;

    destination: LocationState | null;

}


export function useDirectionSearch({

    currentCenter,

    origin,

    destination,

}: UseDirectionSearchProps) {


    const [originText, setOriginText] = useState("");

    const [destText, setDestText] = useState("");


    const debouncedOrigin =
        useDebounce(originText, 300);


    const debouncedDest =
        useDebounce(destText, 300);



    const [originSuggestions, setOriginSuggestions]
        = useState<PlaceSuggestion[]>([]);


    const [destSuggestions, setDestSuggestions]
        = useState<PlaceSuggestion[]>([]);



    const [activeInput, setActiveInput]
        =
        useState<"origin" | "dest" | null>(null);



    const [focusedIndex, setFocusedIndex]
        =
        useState(-1);



    /*
     RESET FOCUS
    */

    useEffect(() => {

        setFocusedIndex(-1);

    }, [
        originSuggestions,
        destSuggestions,
        activeInput
    ]);



    /*
      SYNC ORIGIN
    */

    useEffect(() => {

        if (origin) {

            setOriginText(origin.address);

        }
        else {

            setOriginText("");

        }


    }, [origin]);




    /*
      SYNC DESTINATION
    */

    useEffect(() => {

        if (destination) {

            setDestText(destination.address);

        }
        else {

            setDestText("");

        }


    }, [destination]);





    /*
      SEARCH ORIGIN
    */


    useEffect(() => {


        if (

            activeInput !== "origin"

            ||

            debouncedOrigin.trim().length < 1

            ||

            (
                origin
                &&
                origin.address === debouncedOrigin
            )

        ) {

            setOriginSuggestions([]);

            return;

        }



        const controller =
            new AbortController();



        const locationBias =
            currentCenter
                ?
                `${currentCenter.lat},${currentCenter.lng}`
                :
                undefined;



        SearchService
            .searchPlaces(
                debouncedOrigin,
                locationBias,
                controller.signal
            )

            .then(setOriginSuggestions)

            .catch(() => {

                setOriginSuggestions([]);

            });



        return () => controller.abort();



    }, [
        debouncedOrigin,
        activeInput,
        origin,
        currentCenter
    ]);






    /*
      SEARCH DESTINATION
    */


    useEffect(() => {


        if (

            activeInput !== "dest"

            ||

            debouncedDest.trim().length < 1

            ||

            (
                destination
                &&
                destination.address === debouncedDest
            )

        ) {

            setDestSuggestions([]);

            return;

        }




        const controller =
            new AbortController();



        const locationBias =
            currentCenter
                ?
                `${currentCenter.lat},${currentCenter.lng}`
                :
                undefined;




        SearchService
            .searchPlaces(
                debouncedDest,
                locationBias,
                controller.signal
            )

            .then(setDestSuggestions)

            .catch(() => {

                setDestSuggestions([]);

            });



        return () => controller.abort();



    }, [
        debouncedDest,
        activeInput,
        destination,
        currentCenter
    ]);





    return {


        originText,
        setOriginText,


        destText,
        setDestText,


        debouncedOrigin,
        debouncedDest,


        originSuggestions,
        setOriginSuggestions,


        destSuggestions,
        setDestSuggestions,


        activeInput,
        setActiveInput,


        focusedIndex,
        setFocusedIndex,


    };


}


export default useDirectionSearch;