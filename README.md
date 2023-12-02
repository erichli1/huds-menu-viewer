## TLDR
See Harvard's weekly undergraduate menu at [huds.vercel.app](https://huds.vercel.app/).

## Problem
**Harvard's dining hall (HUDS) website includes a lot of information that isn't necessary.** For instance, it lets me know every day that the salad bar has Baby Arugula, Black Beans, Cherry Tomatoes, Chick Peas, ..., Tabouleh Salad. However, the average user doesn't need to know this; they only need to know the entrees and soup (which are guaranteed to rotate on a daily basis).

**The HUDS website makes it hard to see the upcoming menu at once.** Currently, each meal (lunch vs dinner) and each day has a separate tab making 14 clicks if someone wants to see what this next week in the dining hall will look like. However, it's useful to know what days someone might want to prioritize going to the dining hall to get their favorite dish or eating out to avoid their least favorite dish.

## Solution
This webapp shows the next seven days' worth of soup, lunch entrees, and dinner entrees in a single page by scraping the HUDS website. The desktop view is rendered as a single table, and the mobile view is rendered in bullet point form.

## Set up
The webapp can be run locally with `yarn dev`. This project is deployed on Vercel.

## Tech notes
The API is cached with a policy to expire every 18 hours, ensuring that we get the updated menu for the next week every day. Note that "cache times are best-effort and not guaranteed" per [Vercel's edge caching guidelines](https://vercel.com/docs/edge-network/caching) so there are often more cache misses than my policy suggests.