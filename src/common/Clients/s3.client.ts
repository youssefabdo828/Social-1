import { S3Client as AwsS3Client, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3'
import envConfig from '../../config/env.config'
import fs from 'node:fs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export abstract class S3Client {
    private s3Client = new AwsS3Client({
        credentials: {
            accessKeyId: envConfig.s3bucket.accessKeyId,
            secretAccessKey: envConfig.s3bucket.secretAccessKey
        },
        region: envConfig.s3bucket.bucketRegion
    })

    private bucketName = envConfig.s3bucket.bucketName

    
    putObjectClient(key: string, file: Express.Multer.File) {

        const command = new PutObjectCommand({
            Key: key,
            Bucket: this.bucketName,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype
        })

        return this.s3Client.send(command)
    }

  async  getSignedUrl(key: string) {
        const command = new GetObjectCommand({
            Key: key,
            Bucket: this.bucketName
        })
        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: 60,
        });

        return { url, key }
    }

    deleteObjectClient(key: string) {
        const command = new DeleteObjectCommand({
            Key: key,
            Bucket: this.bucketName
        })

        return this.s3Client.send(command)
    }

    deleteObjectsClient(keys: string[]) {
        const command = new DeleteObjectsCommand({
            Bucket: this.bucketName,
            Delete: {
                Objects: keys.map(key => ({ Key: key }))
            }
        })
        return this.s3Client.send(command)
    }
}