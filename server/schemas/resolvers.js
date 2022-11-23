const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
            }
        throw new AuthenticationError('You must be logged in')
        },
    },

    Mutation:  {
        loginUser: async ( parent, { email, password }) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('There is no profile associated with this email')
            }

            const correctPw = await user.isCorrectPassword(password)

            if (!correctPw) {
                throw new AuthenticationError ('Incorrect email or password')
            }

            const token = signToken(user);
            return { token, user };
        },
        addUser: async ( parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { token, user };
        },
        saveBook: async ( parent, args, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $addToSet: { savedBooks: args }},
                    { new: true, runValidators: true },
                )
            }
            throw new AuthenticationError('You need to be logged in to save a book')
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $pull: { savedBooks: { bookId: args}}},
                    { new: true }
                )
            }
            throw new AuthenticationError('You need to be logged in')
        },
    }
}

module.exports = resolvers