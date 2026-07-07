import { useEffect } from "react";
import type { LocationState } from "./useDirection";


interface UseDirectionRouteProps {

    origin: LocationState | null;

    destination: LocationState | null;

    selectedTransportMode: string;


    onCalculateRoute: (
        start: {
            lat: number;
            lng: number;
        },
        end: {
            lat: number;
            lng: number;
        },
        mode?: string
    ) => void;


    onClear: () => void;


    onCalculateMatrix?: (
        start: {
            lat: number;
            lng: number;
        },
        end: {
            lat: number;
            lng: number;
        }
    ) => void;

}



export function useDirectionRoute({

    origin,

    destination,

    selectedTransportMode,

    onCalculateRoute,

    onClear,

    onCalculateMatrix,


}: UseDirectionRouteProps) {



    // calculate route

    useEffect(() => {


        if (origin && destination) {

            onCalculateRoute(
                {
                    lat: origin.lat,
                    lng: origin.lng
                },

                {
                    lat: destination.lat,
                    lng: destination.lng
                },

                selectedTransportMode
            );


        } else {

            onClear();

        }


    }, [
        origin,
        destination,
        selectedTransportMode
    ]);




    // calculate matrix

    useEffect(() => {


        if (
            origin &&
            destination &&
            onCalculateMatrix
        ) {

            onCalculateMatrix(
                {
                    lat: origin.lat,
                    lng: origin.lng
                },

                {
                    lat: destination.lat,
                    lng: destination.lng
                }
            );

        }


    }, [
        origin,
        destination
    ]);



}