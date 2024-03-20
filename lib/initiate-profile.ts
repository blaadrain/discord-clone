import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";

export const initiateProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return redirectToSignIn();
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (profile) return profile;

  const username =
    user.firstName && user.lastName
      ? user?.firstName || user?.lastName || "Guest"
      : `${user.firstName} ${user.lastName}`;

  const newProfile = await db.profile.create({
    data: {
      userId: user.id,
      name: username,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  return newProfile;
};
