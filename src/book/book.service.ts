import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import * as mongoose from 'mongoose';
import { Query } from 'express-serve-static-core';

@Injectable()
export class BookService {
    constructor(
        @InjectModel(Book.name)
        private bookModel: mongoose.Model<Book>
    ) { }

    async findAll(query: Query): Promise<Book[]> {

        const resPerPage = 2;
        const currentPage = Number(query.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        const keyword = query.keyword
            ? {
                title: {
                    $regex: query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const books = await this.bookModel.find({ ...keyword }).limit(resPerPage).skip(skip);
        return books;
    }

    async create(book: Book): Promise<Book> {
        const res = await this.bookModel.create(book);
        return res;
    }

    async findById(id: string): Promise<Book> {
        const book = await this.bookModel.findById(id);

        if (!book) {
            throw new NotFoundException('Book not found');
        }

        return book;
    }

    async UpdateById(id: string, book: Book): Promise<Book> {
        return await this.bookModel.findByIdAndUpdate(id, book, {
            new: true, // retorna o book atualizado (normal: retorna o original)
            runValidators: true, // garante qua as validacoes sejam aplicadas
        });
    }

    async DeleteById(id: string): Promise<Book> {
        return await this.bookModel.findByIdAndDelete(id);
    }
}
