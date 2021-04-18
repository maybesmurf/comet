import {
  createClient,
  dedupExchange,
  errorExchange,
  subscriptionExchange
} from 'urql'
import { retryExchange } from '@urql/exchange-retry'
import { devtoolsExchange } from '@urql/devtools'
import toast from 'react-hot-toast'
import { cacheExchange } from '@/graphql/cacheExchange'
import i18n from '@/locales/i18n'
import { createApplyLiveQueryPatch } from '@n1ru4l/graphql-live-query-patch'
import { applyAsyncIterableIteratorToSink } from '@n1ru4l/push-pull-async-iterable-iterator'
import { Subscription } from 'sse-z'
import { getOperationAST, parse } from 'graphql'
import { multipartFetchExchange } from '@/graphql/multipartFetchExchange'

const applyLiveQueryPatch = createApplyLiveQueryPatch()
const url = import.meta.env.PROD
  ? `https://${import.meta.env.VITE_API_DOMAIN}/graphql`
  : 'http://localhost:4000/graphql'

export const urqlClient = createClient({
  url,
  requestPolicy: 'cache-and-network',
  fetchOptions: () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        token
      },
      credentials: 'include'
    }
  },
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange,
    errorExchange({
      onError(error, operation) {
        const message = error.message?.substring(10)
        if (import.meta.env.DEV) {
          console.error({
            operation: operation?.query?.definitions[0].name.value,
            message
          })
          console.error({ error, operation })
        }
        if (!error.networkError) {
          const replace = error.graphQLErrors[0]?.extensions?.exception?.replace
          if (replace) {
            toast.error(i18n.t(message, { replace }))
          } else {
            toast.error(i18n.t(message))
          }
        }
      }
    }),
    retryExchange({
      initialDelayMs: 1000,
      randomDelay: false,
      maxNumberAttempts: 10 ** 7
    }),
    multipartFetchExchange,
    subscriptionExchange({
      forwardSubscription: operation => ({
        subscribe: sink => {
          const parsedDocument = parse(operation.query)
          const documentNode = getOperationAST(parsedDocument)
          const searchParams = {
            operationName: documentNode.name.value,
            query: operation.query
          }
          if (operation.variables) {
            searchParams.variables = JSON.stringify(operation.variables)
          }
          const token = localStorage.getItem('token')
          const headers = token ? { token } : null
          return {
            unsubscribe: applyAsyncIterableIteratorToSink(
              applyLiveQueryPatch(
                /*networkInterface.execute({
                  operation: operation.query,
                  variables: operation.variables,
                })*/
                new Subscription({
                  url,
                  searchParams,
                  eventSourceOptions: {
                    // Ensure cookies are included with the request
                    withCredentials: true
                    // headers
                  },
                  onNext: data => {
                    sink.next(JSON.parse(data))
                  }
                })
              ),
              sink
            )
          }
        }
      }),
      enableAllOperations: true
    })
  ]
})
