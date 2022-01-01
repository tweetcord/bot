interface rateLimitsObject {
  tweet: {
    used: number;
    until: number;
  };
  follow: {
    used: number;
    until: number;
  };
  unfollow: {
    used: number;
    until: number;
  };
  block: {
    used: number;
    until: number;
  };
  unblock: {
    used: number;
    until: number;
  };
}
