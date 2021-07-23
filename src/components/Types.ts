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

export interface TrendObject {
    name: string, 
    url: URL,
    promoted_content: boolean | null,
    query: string,
    tweet_volume: number
}