export interface woeidObject {
    name: string,
    placeType: PlaceType,
    url: URL,
    parentid: number, 
    country: string,
    woeid: number,
    countryCode: string
 }

interface PlaceType {
    code: number,
    name: string
}