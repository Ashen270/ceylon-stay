import { Manager, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    // This function is used to prepare headers for each request
    // It fetches the current authentication session and adds the idToken to the headers
    // if it exists. This is useful for authenticated requests.
    // The idToken is used to verify the user's identity and permissions on the server.
    // If the idToken is not present, the request will not be authenticated.
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`); 
      }
      return headers;
    }
  }),
  reducerPath: "api",
  tagTypes: [],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWitchBQ) => {
        try {
          const session = await fetchAuthSession(); //fetching of user information
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload['custom:role'] as string;

          const endpoint = userRole === "manager" ?
            `/managers/${user.userId}`
            : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWitchBQ(endpoint)
          // if user is not found, return null
          return {
            data: {
              cognitoInfo: {...user},
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole
            }
          }
        } catch (error: any) {
          return {error: error.message || "Could not fetch user details"};
        }
      }
    }),
  }),
});

export const { } = api;
