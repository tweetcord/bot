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

export interface TwitterFeed {
    id: string,
    message: string,
    channel: string,
    user: FeedUser,
    webhook: FeedWebhook
}

interface FeedUser {
    screen_name: string,
    id: string
}

interface FeedWebhook {
    id: string,
    token: string,
    url?: URL
}