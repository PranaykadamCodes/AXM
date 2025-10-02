import admin from 'firebase-admin'

// Check if Firebase credentials are properly configured
const isFirebaseConfigured = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_PROJECT_ID !== 'your-firebase-project-id' &&
  process.env.FIREBASE_PRIVATE_KEY && 
  process.env.FIREBASE_PRIVATE_KEY !== '-----BEGIN PRIVATE KEY-----\nYour Firebase private key here\n-----END PRIVATE KEY-----' &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_CLIENT_EMAIL !== 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com'

let messaging: admin.messaging.Messaging | null = null

if (isFirebaseConfigured && !admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })

    messaging = admin.messaging()
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
    messaging = null
  }
}

export { messaging }

export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!messaging) {
    console.warn('Firebase messaging not configured, skipping push notification')
    return null
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: deviceToken,
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
    return response
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}
