import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import { Manager, Property, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { FilterState } from ".";

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
  tagTypes: ["Managers", "Tenants", "Properties"],
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

          let userDetailsResponse = await fetchWitchBQ(endpoint);
          // if user is not found, create a new user
          if (userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWitchBQ
            )
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole
            }
          }
        } catch (error: any) {
          return { error: error.message || "Could not fetch user details" };
        }
      }
    }),

    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Tenant>>({ //query for get request mutation for post and put request
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }], // Invalidate the tenant cache after updating
    }),

    // Property Related Endpoints

    getProperties: build.query<Property[], Partial<FilterState> & { favoritesIds?: number[] }>({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoritesIds: filters.favoritesIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Properties" as const, id })),
            { type: "Properties", id: "LIST" },
          ]
          : [{ type: "Properties", id: "LIST" }],

    }),

    //tenant Related Endpoints

     getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load tenant profile.",
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
      },
    }),

    updateTenantSettings: build.mutation<Tenant, { cognitoId: string } & Partial<Tenant>>({ //query for get request mutation for post and put request
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }], // Invalidate the tenant cache after updating
    }),

    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Added to favorites!!",
          error: "Failed to add to favorites",
        });
      },
    }),

    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Removed from favorites!",
          error: "Failed to remove from favorites.",
        });
      },
    }),

  }),

});

export const {

  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetTenantQuery,
} = api;
