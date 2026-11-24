import { S3Client } from "../Clients/s3.client";
import { BadRequestException } from "../Utils/Errors/exception.error";


class FileService extends S3Client {

   async uploadFile(file: Express.Multer.File, key: string) {
        if (!file || !key) new BadRequestException('File or key is missed', null, 'FILE_MISSED')
        if (!file.mimetype || !file.path) throw new BadRequestException('Mimetype or path are missed', null, 'MIMETYPE_PATH_MISSED')

        const fileKey = `${key}/${file.filename}`

        await this.putObjectClient(fileKey, file)
        return this.getSignedUrl(fileKey)

    }

        deleteFile(key: string) {
        return this.deleteObjectClient(key)
    }

        deleteFiles(keys: string[]) {
        return this.deleteObjectsClient(keys)
    }
}

export default FileService;