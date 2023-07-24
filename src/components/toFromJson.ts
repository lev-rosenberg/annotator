import { Point, LabelData, PolygonData, Annotations} from '../types/annotatorTypes'

export function customJson(numLabels: number, width: number, height: number) {
    const polygonsData: PolygonData[] = []

    const data = generateJson(numLabels, width, height)
    const annotations: Annotations = data.annotations;
    Object.keys(annotations).forEach((key: string) => {
        const labels = annotations[key].latestHumanAnnotation.labels
        labels.forEach((polygon: any) => {
            const points = polygon.coordinates
            const label =  {name: polygon.id, coords: null, visible: null}
            polygonsData.push({coordinates: points, label: label})
        })
    })
      return polygonsData
}

export function fromJson(file: string) {
    const polygonsData: PolygonData[] = []
    fetch(file)
    .then(response => response.json())
    .then(data => {
        const annotations = data.annotations;
        Object.keys(annotations).forEach((key) => {
            const labels = annotations[key].latestHumanAnnotation.labels
            labels.forEach((polygon: any) => {
                const points = polygon.coordinates
                const label =  {name: polygon.id, coords: null, visible: null}
                polygonsData.push({coordinates: points, label: label})
            })
        });
    })
    .catch(error => {
      console.error('Error:', error);
    });
    return polygonsData
}

export function generateLabels(numLabels: number, width: number, height: number) {
    const labels = [];
    for (let i = 0; i < numLabels; i++) {
      const coordinates = [];
      for (let j = 0; j < 3; j++) {
        const x = Math.random() * width; // Generate random x-coordinate within bounds
        const y = Math.random() * height; // Generate random y-coordinate within bounds
        coordinates.push({ x, y });
      }
  
      const label = {
        coordinates,
        id: `Scratch`,
        polygonId: `Polygon${i + 1}`,
        probability: null,
        type: 'polygon',
      };
  
      labels.push(label);
    }
  
    return labels;
  }

export function generateJson(numLabels: number, width: number, height: number) {

    const labels = generateLabels(numLabels, width, height);

    const data = {
        annotations: {
            GEAR_CIRCLE_THING: {
                latestHumanAnnotation: {
                createdAt: 1683301353.653,
                id: '645523e9e9437845fa972817',
                inferenceId: '61ddf9b153217294be67243c',
                labels,
                modelId: 'GEAR_CIRCLE_THING',
                trainingTags: [],
                type: 'human',
                updatedAt: 1683301353.653,
                user: 'demo@maddox.ai',
                },
                machinePrediction: null,
            },
        },
    };
    return data;
}


/* 

"data": [
        {
            "annotations": {
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
            },
        }
    ],
*/