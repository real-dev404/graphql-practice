const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require('graphql');
const { clients, projects } = require('../sampleData');

const Project = require('../models/Project');
const Client = require('../models/Client');

const ProjectType= new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      async resolve(parent, args) {
        return await Client.findById(parent.clientId);
      }
     },
  })
});

const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        return await Project.findById(args.id);
      }
    },
    projects: {
      type: new GraphQLList(ProjectType),
      async resolve(parent) {
        return await Project.find();
      }
    },
    clients: {
      type: new GraphQLList(ClientType),
      async resolve(parent) {
        return await Client.find();
      }
    },
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID} },
      async resolve(parent, args) {
        return await Client.findById(args.id);
      }
    }
  }
});

// Mutations
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        status: {
          type: new GraphQLEnumType({
            name: 'ProjectStatus',
            values: {
              'new': { value: 'Not Started' },
              'progress': { value: 'In Progress' },
              'completed': { value: 'Completed' },
            }
          }),
          defaultValue: 'Not Started',
        },
        clientId: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const project = new Project({
          name: args.name,
          description: args.description,
          status: args.status,
          clientId: args.clientId,
        });

        return project.save();
      },
    },
    addClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const client = new Client({
          name: args.name,
          email: args.email,
          phone: args.phone,
        });

        return client.save();
      }
    },
    deleteClient: {
      type: ClientType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Client.findByIdAndDelete(args.id);
      },
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})
