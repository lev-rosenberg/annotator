import { Point, LabelData} from '../../types/svgTypes'

export function toJson(polygonPoints: Point[][], labelData: LabelData[][]) {

}

export function fromJson() {

}

/* 

"data": [
        {
            "annotations": {
                "2": {
                    "latestHumanAnnotation": {
                        "createdAt": 1685630537.314,
                        "id": "6478ae496e9b7648320d898b",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "ASF__2",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "2",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1685630537.314,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "ANOTHER_TEST": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb451ed47e3236578e7a",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "HELL_YEAH_CLASS__ANOTHER_TEST",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "ANOTHER_TEST",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "ASDASD": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb451ed47e3236578e12",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "ASDASD__ASDASD",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "ASDASD",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "BREAK_IT": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "DELETE_ME_2": {
                    "latestHumanAnnotation": {
                        "createdAt": 1683301353.653,
                        "id": "645523e9e9437845fa972817",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": [
                                    {
                                        "x": 202.33885484353505,
                                        "y": 9.471603608670122
                                    },
                                    {
                                        "x": 127.02354495740872,
                                        "y": 85.77791457700607
                                    },
                                    {
                                        "x": 243.4649780050382,
                                        "y": 141.27341346306858
                                    },
                                    {
                                        "x": 312.3388469140616,
                                        "y": 82.80494142239559
                                    }
                                ],
                                "id": "C__DELETE_ME_2",
                                "polygonId": "85cfecc4-20f7-44c7-8fe0-3e0ee4dfebbd",
                                "probability": null,
                                "type": "polygon"
                            },
                            {
                                "coordinates": [
                                    {
                                        "x": 24.833773845926547,
                                        "y": 464.874385837549
                                    },
                                    {
                                        "x": 27.23972295969305,
                                        "y": 509.62504368712956
                                    },
                                    {
                                        "x": 230.78301798433924,
                                        "y": 499.03886656142237
                                    },
                                    {
                                        "x": 140.800521129472,
                                        "y": 441.7772721087333
                                    }
                                ],
                                "id": "A__DELETE_ME_2",
                                "polygonId": "923195c4-ccde-4fd6-9496-609a102e3a7c",
                                "probability": null,
                                "type": "polygon"
                            }
                        ],
                        "modelId": "DELETE_ME_2",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1683301353.653,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "EMPTY": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "MODEL_A": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb451ed47e3236578e2b",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "ASDASD__MODEL_A",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "MODEL_A",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "NO_SAMPLES": {
                    "latestHumanAnnotation": {
                        "createdAt": 1671112261.429,
                        "id": "6448fb461ed47e3236578f20",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "TEAST__NO_SAMPLES",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "NO_SAMPLES",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1671112261.429,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "OBJECT_DETECTION_MODEL": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "SINGLE_CLASS": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb441ed47e3236578de3",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "SINGLE_CLASS__SINGLE_CLASS",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "SINGLE_CLASS",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "SINGLE_CLASS_ONLY": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "STREAMLINED_DEFECT_DETECTION": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb461ed47e3236578f1c",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "OK__STREAMLINED_DEFECT_DETECTION",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "STREAMLINED_DEFECT_DETECTION",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "STREAMLINED_OBJECT_DETECTION": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb461ed47e3236578f1d",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "EMPTY__STREAMLINED_OBJECT_DETECTION",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "STREAMLINED_OBJECT_DETECTION",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "SUCCESS": {
                    "latestHumanAnnotation": {
                        "createdAt": 1685630861.49,
                        "id": "6478af8d6e9b7648320d898c",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "ED__SUCCESS",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "SUCCESS",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1685630861.49,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "SUCCESS_1": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "SURFACE_INSPECTION_TEST": {
                    "latestHumanAnnotation": {
                        "createdAt": 1686758178.339,
                        "id": "6489e322bfecb3e736de4ea2",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": [
                                    {
                                        "x": 102.65176247032966,
                                        "y": 32.34154863326556
                                    },
                                    {
                                        "x": 41.705815298330066,
                                        "y": 98.73794908623276
                                    },
                                    {
                                        "x": 77.38149169169567,
                                        "y": 147.79200613730674
                                    },
                                    {
                                        "x": 176.48059278437665,
                                        "y": 92.79200277701176
                                    }
                                ],
                                "id": "ANOTHER_POLYGON_LABEL__SURFACE_INSPECTION_TEST",
                                "polygonId": "3f2e990f-58be-4b9a-93d3-905cf50500ce",
                                "probability": null,
                                "type": "polygon"
                            },
                            {
                                "coordinates": [
                                    {
                                        "x": 84.33996324195365,
                                        "y": 206.669897352274
                                    },
                                    {
                                        "x": 23.394016069954063,
                                        "y": 273.0662978052412
                                    },
                                    {
                                        "x": 59.06969246331967,
                                        "y": 322.1203548563152
                                    },
                                    {
                                        "x": 158.16879355600065,
                                        "y": 267.1203514960202
                                    }
                                ],
                                "id": "ANOTHER_POLYGON_LABEL__SURFACE_INSPECTION_TEST",
                                "polygonId": "8d466d03-2b68-459f-a8ec-da9e81071bad",
                                "probability": null,
                                "type": "polygon"
                            },
                            {
                                "coordinates": [
                                    {
                                        "x": 237.42660479117708,
                                        "y": 156.86179771827153
                                    },
                                    {
                                        "x": 176.4806576191775,
                                        "y": 223.25819817123875
                                    },
                                    {
                                        "x": 212.15633401254308,
                                        "y": 272.31225522231273
                                    },
                                    {
                                        "x": 311.2554351052241,
                                        "y": 217.31225186201772
                                    }
                                ],
                                "id": "ANOTHER_POLYGON_LABEL__SURFACE_INSPECTION_TEST",
                                "polygonId": "4e219e42-9130-4d94-8874-cb3af2543562",
                                "probability": null,
                                "type": "polygon"
                            },
                            {
                                "coordinates": [
                                    {
                                        "x": 175.16648741469865,
                                        "y": 346.57205955954544
                                    },
                                    {
                                        "x": 114.22054024269906,
                                        "y": 412.96846001251265
                                    },
                                    {
                                        "x": 149.89621663606465,
                                        "y": 462.02251706358663
                                    },
                                    {
                                        "x": 248.99531772874565,
                                        "y": 407.0225137032917
                                    }
                                ],
                                "id": "ANOTHER_POLYGON_LABEL__SURFACE_INSPECTION_TEST",
                                "polygonId": "44ab27f3-a6f2-46be-85de-ed7b6cf2e8aa",
                                "probability": null,
                                "type": "polygon"
                            }
                        ],
                        "modelId": "SURFACE_INSPECTION_TEST",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1686758178.339,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "TEST": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "TESTASD": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb461ed47e3236578eeb",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": [
                                    {
                                        "x": 198.03412932542517,
                                        "y": 142.44636580954602
                                    },
                                    {
                                        "x": 112.5094763427838,
                                        "y": 208.50198791852918
                                    },
                                    {
                                        "x": 140.32237162169156,
                                        "y": 281.5108334074053
                                    },
                                    {
                                        "x": 218.893800784606,
                                        "y": 260.6511632677264
                                    },
                                    {
                                        "x": 175.08849072032626,
                                        "y": 237.01020377609035
                                    }
                                ],
                                "id": "KRATZER__TESTASD",
                                "polygonId": "10d092ba-fc5e-4c79-9797-69c484414c84",
                                "probability": null,
                                "type": "polygon"
                            }
                        ],
                        "modelId": "TESTASD",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "TEST_2": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                },
                "TEST_MULTI_ERROR_CLASS_SELECT": {
                    "latestHumanAnnotation": {
                        "createdAt": 1685631547.48,
                        "id": "6478b23b6e9b7648320d898d",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": [
                                    {
                                        "x": 138.97232987499223,
                                        "y": 67.95907884922751
                                    },
                                    {
                                        "x": 112.00210095615728,
                                        "y": 106.96958796566392
                                    },
                                    {
                                        "x": 142.82521972054008,
                                        "y": 133.9398164906076
                                    },
                                    {
                                        "x": 189.05989786711433,
                                        "y": 121.41792467545518
                                    },
                                    {
                                        "x": 196.76567755821003,
                                        "y": 90.11319513757411
                                    }
                                ],
                                "id": "OTHER_2__TEST_MULTI_ERROR_CLASS_SELECT",
                                "polygonId": "a6f26f35-970f-4b43-8084-19759a6beb1a",
                                "probability": null,
                                "type": "polygon"
                            },
                            {
                                "coordinates": [
                                    {
                                        "x": 167.18988491217837,
                                        "y": 221.2292201124908
                                    },
                                    {
                                        "x": 140.21965599334342,
                                        "y": 260.2397292289272
                                    },
                                    {
                                        "x": 171.04277475772622,
                                        "y": 287.2099577538709
                                    },
                                    {
                                        "x": 217.27745290430047,
                                        "y": 274.68806593871847
                                    },
                                    {
                                        "x": 224.98323259539617,
                                        "y": 243.3833364008374
                                    }
                                ],
                                "id": "OTHER_2__TEST_MULTI_ERROR_CLASS_SELECT",
                                "polygonId": "aa659c94-40fc-45eb-8ab2-fb3233b0eb79",
                                "probability": null,
                                "type": "polygon"
                            }
                        ],
                        "modelId": "TEST_MULTI_ERROR_CLASS_SELECT",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1685631547.48,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "TEST_ONLY_CLASS_LABELS": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb461ed47e3236578edb",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "CLASS_3__TEST_ONLY_CLASS_LABELS",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "TEST_ONLY_CLASS_LABELS",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "TEST_ONLY_CLASS_LABELS_OTHER": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb451ed47e3236578e51",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "OTHER_1__TEST_ONLY_CLASS_LABELS_OTHER",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "TEST_ONLY_CLASS_LABELS_OTHER",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "THIS_IS_A_MODEL_NAME": {
                    "latestHumanAnnotation": {
                        "createdAt": 1680015564.286,
                        "id": "6448fb441ed47e3236578df2",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "SOME_OTHER_CLASS__THIS_IS_A_MODEL_NAME",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "THIS_IS_A_MODEL_NAME",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1680015564.286,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": null
                },
                "WIRES_MODEL": {
                    "latestHumanAnnotation": {
                        "createdAt": 1683642540.457,
                        "id": "645a58ac05ae472230e33d5e",
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "IGNORE",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "WIRES_MODEL",
                        "trainingTags": [],
                        "type": "human",
                        "updatedAt": 1683642540.457,
                        "user": "demo@maddox.ai"
                    },
                    "machinePrediction": {
                        "createdAt": 1641937322.212,
                        "inferenceId": "61ddf9b153217294be67243c",
                        "labels": [
                            {
                                "coordinates": null,
                                "id": "OK",
                                "polygonId": null,
                                "probability": null,
                                "type": "class"
                            }
                        ],
                        "modelId": "WIRES_MODEL",
                        "trainingTags": [],
                        "type": "machine",
                        "updatedAt": 1641937322.212,
                        "user": "unknown_user"
                    }
                },
                "__UNKNOWN_MODEL_ID__": {
                    "latestHumanAnnotation": null,
                    "machinePrediction": null
                }
            },
        }
    ],
*/