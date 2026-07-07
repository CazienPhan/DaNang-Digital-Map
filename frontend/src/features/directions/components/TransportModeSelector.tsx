import React from "react";

import {
    Car,
    Bike,
    Footprints,
    Navigation,
} from "lucide-react";


interface TransportModeSelectorProps {

    selectedMode: string;

    onChange: (mode: string) => void;

}



const transportModes = [
    {
        id: "car",
        label: "Car",
        icon: <Car className="h-5 w-5" />
    },

    {
        id: "motorcycle",
        label: "Motorbike",
        icon: <Navigation className="h-5 w-5" />
    },

    {
        id: "bike",
        label: "Bicycle",
        icon: <Bike className="h-5 w-5" />
    },

    {
        id: "foot",
        label: "Walking",
        icon: <Footprints className="h-5 w-5" />
    }
];



export const TransportModeSelector: React.FC<
    TransportModeSelectorProps
> = ({
    selectedMode,
    onChange
}) => {


        return (

            <div className="transport-tabs flex gap-2">


                {
                    transportModes.map((mode) => {


                        const active =
                            selectedMode === mode.id;


                        return (

                            <button

                                key={mode.id}

                                type="button"

                                className={`
flex
items-center
gap-2
px-3
py-2
rounded-md
border

${active
                                        ?
                                        "bg-primary text-white"
                                        :
                                        "bg-white"
                                    }

`}

                                onClick={() => onChange(mode.id)}

                            >


                                {mode.icon}

                                <span>
                                    {mode.label}
                                </span>


                            </button>


                        );


                    })

                }



            </div>


        );


    };


export default TransportModeSelector;