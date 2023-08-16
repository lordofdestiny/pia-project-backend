import { Types } from "mongoose";
import { UserModel } from "../models/user";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";

const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

export default new Strategy(jwtOptions, async (payload: { id: string }, done) => {
    console.log(payload);
    const user = await UserModel.findById(new Types.ObjectId(payload.id));
    if (user) {
        return done(null, user);
    }
    return done(null, false);
});
