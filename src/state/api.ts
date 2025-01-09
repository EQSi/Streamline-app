import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import reducer from ".";

export const api = createApi({
    baseQuery: fetchBaseQuery({baseUrl:process.env.REACT_APP_API_BASE_URL}),
    reducerPath: "api",
    tagTypes: [],
    endpoints: (build) => ({}),
});

export const{} = api; 