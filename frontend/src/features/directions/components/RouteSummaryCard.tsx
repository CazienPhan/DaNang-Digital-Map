import React from "react";

import {
    Navigation,
    Clock
} from "lucide-react";


import type { RouteResult } from "@/services/map4d/routing.service";


interface RouteSummaryCardProps {

    routeData: RouteResult;

}



export const RouteSummaryCard:
    React.FC<RouteSummaryCardProps>
    = ({
        routeData
    }) => {


        return (

            <div
                className="
mt-3
rounded-xl
border
bg-white
p-4
shadow
"
            >


                <div
                    className="
flex
gap-6
"
                >


                    <div
                        className="
flex
items-center
gap-2
"
                    >

                        <Navigation
                            className="h-4 w-4"
                        />


                        <div>

                            <div className="font-semibold">
                                {routeData.distance}
                            </div>

                            <div className="text-sm text-gray-500">
                                Distance
                            </div>

                        </div>


                    </div>




                    <div
                        className="
flex
items-center
gap-2
"
                    >

                        <Clock
                            className="h-4 w-4"
                        />


                        <div>

                            <div className="font-semibold">
                                {routeData.duration}
                            </div>


                            <div className="text-sm text-gray-500">
                                Duration
                            </div>


                        </div>


                    </div>


                </div>


            </div>


        );


    };


export default RouteSummaryCard;