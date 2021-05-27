import { ApolloServer } from 'apollo-server'
import { gql } from 'apollo-server-core'

import { sqlGetAll, sqlGet } from './dbWrapper'
import { sortedProducts } from './productSort'

const typeDefs = gql`
  type Query {
    batches: [Batch!]!
    batch(id: ID!): Batch
    labTests: [LabTest!]!
    labTest(id: ID!): [LabTest!]!
    products: [Product!]!
    product(id: ID!): Product
    sortedProducts(limit: Int, skip: Int): [Relevance!]
    reviews: [Review!]!
    review(id: ID!): Review
    sessions: [Session!]!
    session: Session
    users: [User!]!
    user(id: ID!): User
  }

  type Batch {
    id: ID!
    product: Product
    labTests: [LabTest!]!
  }

  type Effects {
    id: ID!
    name: String!
  }

  type LabTest {
    id: ID!
    batch: Batch!
    thc: String
    thca: String
    cbd: String
  }

  type Product {
    id: ID!
    name: String!
    brand: String!
    batches: [Batch!]
  }

  type Relevance {
    id: ID!
    name: String!
    brand: String!
    test_count: String
    review_count: String
    avg_score: String
  }

  type Review {
    id: ID!
    score: Int!
    user: User!
    batch: Batch
    product: Product!
    text: String
  }

  type Session {
    id: ID!
    user: User!
    batch: Batch
    product: Product!
    effects: [Effects!]!
  }

  type User {
    id: ID!
    name: String!
    reviews: [Review!]!
  }
`
const resolvers = {
  Query: {
    batches: async () => sqlGetAll('select * from batches'),
    batch: async (_parent: any, args: any) => sqlGet(`select * from batches where id=${args.id}`),
    labTests: async () => sqlGetAll('select * from labTests'),
    labTest: async (_parent: any, args: any) => sqlGet(`select * from labTests where id=${args.id}`),
    products: async () => sqlGetAll('select * from products'),
    product: async (_parent: any, args: any) => {
      return sqlGet(`select * from products where id='${args.id}'`)
    },
    sortedProducts: async (_parent: any, args: any) => sortedProducts({ limit: args.limit, skip: args.skip }),
    reviews: async () => sqlGetAll('select * from reviews'),
    review: async (_parent: any, args: any) => sqlGet(`select * from reviews where id=${args.id}`),
    sessions: async () => sqlGetAll('select * from sessions'),
    session: async (_parent: any, args: any) => sqlGet(`select * from sessions where id=${args.id}`),
    users: async () => sqlGetAll('select * from users'),
    user: async (_parent: any, args: any) => sqlGet(`select * from users where id=${args.id}`)
  },
  Batch: {
    product: async (parent: any) => {
      return sqlGet(`select * from products where id=${parent.product_id}`)
    },
    labTests: async (parent: any) => {
      return sqlGetAll(`select * from labTests where batch_id=${parent.id}`)
    }
  },
  LabTest: {
    batch: async (parent: any) => {
      return sqlGet(`select * from batches where id=${parent.batch_id}`)
    }
  },
  Product: {
    batches: async (parent: any) => {
      return sqlGetAll(`select * from products where product_id=${parent.id}`)
    }
  },
  Review: {
    user: async (parent: any) => {
      return sqlGet(`select * from users where id=${parent.user_id}`)
    },
    batch: async (parent: any) => {
      return sqlGet(`select * from batches where id=${parent.batch_id}`)
    },
    product: async (parent: any) => {
      return sqlGet(`select * from products where id=${parent.product_id}`)
    }
  },
  Session: {
    user: async (parent: any) => {
      return sqlGet(`select * from users where id=${parent.user_id}`)
    },
    batch: async (parent: any) => {
      return sqlGet(`select * from batches where id=${parent.batch_id}`)
    },
    product: async (parent: any) => {
      return sqlGet(`select * from products where id=${parent.product_id}`)
    },
    effects: async (parent: any) => {
      return sqlGetAll(`
        select Effects.id as id, Effects.name as name
        from SessionsToEffects
        inner join Effects
        on SessionsToEffects.effect_id = Effects.id
        where SessionsToEffects.session_id = ${parent.id}
      `)
    }
  },
  User: {
    reviews: async (parent: any) => {
      return sqlGetAll(`select * from reviews where user_id=${parent.id}`)
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server
  .listen()
  .then(({ url }: { url: string }) => {
    console.log(`Server is running on ${url}`)
  })
