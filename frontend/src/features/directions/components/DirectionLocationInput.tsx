import React from "react";

import {
    Input
} from "@/components/ui";

import {
    MapPin
} from "lucide-react";


import type { PlaceSuggestion }
    from "@/services/map4d/search.service";


import type { LocationState }
    from "@/features/directions/hooks/useDirection";



interface DirectionLocationInputProps {


    placeholder: string;


    value: string;



    onChange: (value: string) => void;



    suggestions: PlaceSuggestion[];


    active: boolean;



    onFocus: () => void;


    onBlur: () => void;



    onSelect:
    (item: PlaceSuggestion) => void;



    onKeyDown:
    (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => void;



    focusedIndex: number;



    cachedGps?: LocationState | null;



    onSelectCurrent?:
    () => void;



    onClearLocation?:
    () => void;


}





export const DirectionLocationInput:
    React.FC<DirectionLocationInputProps>
    =
    ({
        placeholder,

        value,

        onChange,

        suggestions,

        active,

        onFocus,

        onBlur,

        onSelect,

        onKeyDown,

        focusedIndex,

        cachedGps,

        onSelectCurrent,

        onClearLocation
    }) => {


        return (


            <div className="input-group">


                <Input


                    placeholder={placeholder}


                    value={value}



                    onChange={(e) => {


                        const text = e.target.value;


                        onChange(text);



                        if (onClearLocation) {

                            onClearLocation();

                        }


                    }}



                    onFocus={onFocus}


                    onBlur={onBlur}


                    onKeyDown={onKeyDown}


                />




                {
                    active &&

                    (
                        suggestions.length > 0 ||
                        !!cachedGps
                    )

                    &&


                    <div

                        className="direction-autocomplete-list"

                    >



                        {/* Current Location */}

                        {

                            cachedGps &&

                            <div


                                className={

                                    `
direction-autocomplete-item

${focusedIndex === 0

                                        ?

                                        "focused"

                                        :

                                        ""

                                    }

`

                                }



                                onMouseDown={

                                    onSelectCurrent

                                }


                            >



                                <span

                                    className="name flex items-center gap-2"

                                >


                                    <MapPin

                                        className="h-4 w-4 text-green-500"

                                    />


                                    Current Location


                                </span>




                                <span className="addr">


                                    {cachedGps.address}


                                </span>



                            </div>

                        }




                        {/* Search suggestions */}

                        {


                            suggestions.map(
                                (item, index) => {


                                    // Nếu có GPS thì suggestion index phải +1
                                    const actualIndex =

                                        cachedGps

                                            ?

                                            index + 1

                                            :

                                            index;



                                    return (


                                        <div


                                            key={item.id}



                                            className={

                                                `
direction-autocomplete-item

${focusedIndex === actualIndex

                                                    ?

                                                    "focused"

                                                    :

                                                    ""

                                                }

`

                                            }



                                            onMouseDown={() =>
                                                onSelect(item)
                                            }



                                        >


                                            <span className="name">


                                                {item.name}


                                            </span>




                                            <span className="addr">


                                                {item.address}


                                            </span>



                                        </div>



                                    )


                                }

                            )


                        }



                    </div>

                }




            </div>


        );


    };



export default DirectionLocationInput;