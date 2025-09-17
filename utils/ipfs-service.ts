export interface UploadedFile{
    originalName:string;
    hash:string;
    size:number;
    type:string;
}
export interface DocumentBundle{
    hash:string,
    files:UploadedFile[];
    uploadedAt:string;
}

export class PinataIPFSService{
    private apiKey:string;
    private secretKey:string;
    constructor(){
        this.apiKey=process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
        this .secretKey=process.env.NEXT_PUBLIC_PINATA_SECRET_KEY||''

        if(!this.apiKey || !this.secretKey){
            throw new Error('Pinata credentials not configured')
        }
    }
    async uploadFile(file:File):Promise<UploadedFile>{
        const formData=new FormData();
        formData.append('file',file);
        const metadata=JSON.stringify({
            name:file.name,
        })
        formData.append('pinataMetadata',metadata)
        const options=JSON.stringify({
            cidVersion:0
        })
        formData.append('pinataOptions',options)
        try{
            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                  'pinata_api_key': this.apiKey,
                  'pinata_secret_api_key': this.secretKey,
                },
                body: formData,
              });
            const result=await response.json();
            if(!response.ok){
                throw new Error(result.error || 'Upload failed')
            }
            return{
                originalName:file.name,
                hash:result.IpfsHash,
                size:file.size,
                type:file.type
            }
        }catch(error){
            console.error('Pinata upload error: ',error)
            throw error;
        }
    }
    async uploadJSON(jsonObject: any, name: string): Promise<string> {
        const data = JSON.stringify({
          pinataContent: jsonObject,
          pinataMetadata: {
            name: name,
          },
        });
    
        try {
          const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'pinata_api_key': this.apiKey,
              'pinata_secret_api_key': this.secretKey,
            },
            body: data,
          });
    
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
          }
    
          return result.IpfsHash;
        } catch (error) {
          console.error('Pinata JSON upload error:', error);
          throw new Error('Failed to upload JSON to Pinata');
        }
      }
}