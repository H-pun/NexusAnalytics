'use client';

import { ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3000/api/graphql' }),
  cache: new InMemoryCache(),
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ApolloProvider>
  );
}











