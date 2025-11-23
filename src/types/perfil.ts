export type ModalidadPreferida = 'presencial' | 'virtual' | 'mixta';

export type TipoEvidencia = 'CERTIFICADO' | 'DIPLOMA' | 'PUBLICACION' | 'CURSO' | 'OTRO';

export interface PerfilDestacado {
    id: number;
    perfil_id: number;
    titulo: string;
    descripcion?: string | null;
    evidenciaUrl?: string | null;
}

export interface PerfilEvidencia {
    id: number;
    perfil_id: number;
    tipo: TipoEvidencia;
    nombre: string;
    url: string;
    sha256: string;
    fechaEmision?: string | null;     // YYYY-MM-DD
    fechaVencimiento?: string | null; // YYYY-MM-DD
    notaPostulante?: string | null;
}

export interface PerfilDocente {
    id?: number;
    user_id: number;
    resumen?: string | null;
    modalidadPreferida?: ModalidadPreferida | null;
    destacados: PerfilDestacado[];
    evidencias: PerfilEvidencia[];
    createdAt?: string;
    updatedAt?: string;
}

// DTOs que usa el FE (coinciden con el backend)
export interface UpsertPerfilDto {
    resumen?: string;
    modalidadPreferida?: ModalidadPreferida;
}

export interface CreateDestacadoDto {
    titulo: string;
    descripcion?: string;
    evidenciaUrl?: string;
}

export interface UpdateDestacadoDto extends Partial<CreateDestacadoDto> { }

export interface CreateEvidenciaDto {
    tipo: TipoEvidencia;
    nombre: string;
    url: string;
    sha256: string; // el backend lo valida; si luego calculas en BE, puedes mandar dummy hasta cambiar contrato
    fechaEmision?: string;     // YYYY-MM-DD
    fechaVencimiento?: string; // YYYY-MM-DD
    notaPostulante?: string;
}

export interface UpdateEvidenciaDto extends Partial<CreateEvidenciaDto> { }
